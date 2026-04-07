

async function testSMS() {
  const username = "5437130857";
  const password = "Aa173680**";
  const header = "HEDABILISIM";
  const formattedPhone = "05437130857"; // Kendi numaranız veya test numarası
  const message = "Test mesaji";

  const apiUrl = "https://api.netgsm.com.tr/sms/send/get";

  const requestData = new URLSearchParams({
    usercode: username,
    password: password,
    gsmno: formattedPhone,
    message: message,
    msgheader: header,
    dil: "TR",
  });

  console.log("Request Body:", requestData.toString());

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: requestData.toString(),
  });

  const responseText = await response.text();
  console.log("Response:", responseText);
}

testSMS();
