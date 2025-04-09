const form = document.getElementById("queryForm");

form.addEventListener("submit", async (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
    form.classList.add("was-validated");
    return;
  }
  //req-res
  event.preventDefault();
  const requirements = document.getElementById("requirements");

  if (!requirements.value) {
    return;
  }
  form.classList.remove("was-validated");
  const requirementsValue = requirements.value;
  requirements.value = "";
  document.querySelector("#submit-proposal").disabled = true;
  const loading = document.getElementById("loading");
  // reinitializeVanta();
  loading.style.display = "block";
  window.scrollBy(2000, 2000);
  try {
    const response = await fetch("/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requirements: requirementsValue }),
    });

    const data = await response.json();
    if (typeof data !== "string") {
      const proposal = document.getElementById("proposal");
      loading.style.display = "none";
      proposal.innerText = data.message;
      proposal.style.display = "block ";
      document.querySelector("#submit-proposal").disabled = false;
    } else {
      const proposalHead = document.getElementById("proposal-head");
      const proposal = document.getElementById("proposal");
      loading.style.display = "none";
      proposal.innerText = data;
      // reinitializeVanta();
      proposalHead.style.display = "block";
      proposal.style.display = "block ";
      window.scrollBy(12000, 12000);
      document.querySelector("#submit-proposal").disabled = false;

      const download = document.getElementById("downloadPDF");
      download.style.display = "inline-block";

      const mailOption = document.getElementById("send-mail");
      mailOption.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("proposal").innerText =
      "An error occurred: " + error.message;
  }
});

document
  .getElementById("send-mail")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const mailid = document.getElementById("mailid").value;
    //invalid req
    if (!mailid) {
      return alert("Enter your email");
    }
    //valid req
    try {
      const response = await fetch("/mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mailid }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Email sent successfully!");
      } else {
        alert("Failed to send email: " + result.error);
      }
    } catch (error) {
      alert("Error sending email: " + error.message);
    }
  });
