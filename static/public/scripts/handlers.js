import { cloneTemplateIntoParent, makeModalWindowsInvisible } from "./utils.js";

export function handleAutoLogin(result) {
  if (result.isSuccess) {
    document.open();
    document.write(result.html);
    document.close();
    if (result.jwt) localStorage.setItem("jwt", result.jwt);
  } else {
    localStorage.removeItem("jwt");
    document.body.style.visibility = "visible";
  }
}

export function handleAutoLoginFailure(err) {
  document.body.style.visibility = "visible";
}

export function handleLogin(result) {
  if (result.isSuccess) {
    localStorage.setItem("jwt", result.jwt);
    window.location.href = window.location.origin;
  }
}

export function handleRegister(result) {
  if (result) {
    makeModalWindowsInvisible();
    setTimeout(
      () => (document.getElementById("successModal").isVisible = ""),
    );
  }
}

export function handleLoginOrRegisterFailure(err, modalSelector) {
  const modalContentDiv = document
    .querySelector(modalSelector)
    .querySelector('div[slot="modal-content"]');
  cloneTemplateIntoParent(
    document.getElementById(
      modalSelector === "#loginModalWindow"
        ? "loginErrorMessageTemplate"
        : "registerErrorMessageTemplate",
    ),
    modalContentDiv,
  );
  setTimeout(
    () => modalContentDiv.querySelector(".errorMessage").remove(),
    5000,
  );
}
