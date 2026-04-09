const redisClient = require("../config/redis");
const fetch = require("node-fetch");

class SMSService {
  static generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendSMS(phoneNumber, message) {
    try {
      // Telefon numarası kontrolü
      if (!phoneNumber) {
        throw new Error("Telefon numarası boş olamaz");
      }

      // NetGSM API credentials
      const username = process.env.NETGSM_USERNAME;
      const password = process.env.NETGSM_PASSWORD;
      const header = process.env.NETGSM_HEADER || "HEDABILISIM";

      // Telefon numarasını NetGSM formatına çevir
      let formattedPhone = String(phoneNumber)
        .replace(/\D/g, "") // Tüm rakam olmayan karakterleri kaldır
        .replace(/^90/, "") // 90 ile başlıyorsa kaldır
        .replace(/^\+90/, "") // +90 ile başlıyorsa kaldır
        .replace(/^0/, ""); // Baştaki 0'ı kaldır

      // Eğer 10 haneden kısa ise, başına 0 ekle
      if (formattedPhone.length === 10) {
        formattedPhone = "0" + formattedPhone;
      }

      // Telefon numarası formatı kontrolü
      if (formattedPhone.length !== 11) {
        throw new Error("Geçersiz telefon numarası formatı");
      }

      const apiUrl = "https://api.netgsm.com.tr/sms/send/get";

      const requestData = new URLSearchParams({
        usercode: username,
        password: password,
        gsmno: formattedPhone,
        message: message,
        msgheader: header,
        dil: "TR",
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: requestData.toString(),
      });

      const responseText = await response.text();

      // Yanıtı parçala
      const [responseCode, jobId] = responseText.split(" ");

      // Başarılı yanıt kodları
      if (
        responseCode === "00" ||
        responseCode === "01" ||
        responseCode === "02"
      ) {
        console.log(responseText);
        return {
          success: true,
          jobId: jobId,
          message: "SMS başarıyla gönderildi",
        };
      } else {
        console.error(`SMS gönderimi başarısız. Hata kodu: ${responseCode}`);
        return {
          success: false,
          errorCode: responseCode,
          message: "SMS gönderilemedi",
        };
      }
    } catch (error) {
      console.error("SMS gönderimi sırasında hata:", error);
      return {
        success: false,
        error: error.message,
        message: "SMS gönderimi sırasında bir hata oluştu",
      };
    }
  }

  static async saveVerificationCode(userId, code, type = "reset") {
    try {
      const key = `sms_verify_${userId}_${type}`;
      await redisClient.set(key, code, {
        EX: 180, // 3 dakika
      });
      console.log(`Doğrulama kodu kaydedildi: ${userId} (${type})`);
      return true;
    } catch (error) {
      console.error("SMS doğrulama kodu kayıt hatası:", error);
      return false;
    }
  }

  static async verifyCode(userId, code, type = "reset") {
    try {
      const key = `sms_verify_${userId}_${type}`;
      const savedCode = await redisClient.get(key);
      console.log(
        `Doğrulama kodu kontrolü: ${userId} (${type}), Beklenen: ${savedCode}, Girilen: ${code}`
      );
      return savedCode === code;
    } catch (error) {
      console.error("SMS doğrulama kodu hatası:", error);
      return false;
    }
  }

  static async deleteVerificationCode(userId, type = "reset") {
    try {
      const key = `sms_verify_${userId}_${type}`;
      await redisClient.del(key);
      console.log(`Doğrulama kodu silindi: ${userId} (${type})`);
      return true;
    } catch (error) {
      console.error("Doğrulama kodu silme hatası:", error);
      throw error;
    }
  }
}

module.exports = SMSService;
