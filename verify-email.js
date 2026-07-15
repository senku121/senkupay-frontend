/*==================================================
    SENKU PAY
    EMAIL VERIFICATION
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://senkustakes-api.onrender.com";
    const VERIFY_ENDPOINT = `${API_BASE_URL}/api/auth/verify-email`;
    const RESEND_ENDPOINT = `${API_BASE_URL}/api/auth/resend-otp`;
    const OTP_LENGTH = 6;
    const OTP_LIFETIME_SECONDS = 120;

    const form = document.getElementById("verifyForm");
    const otpContainer = document.getElementById("otpContainer");
    const inputs = Array.from(document.querySelectorAll(".otp-input"));
    const verifyBtn = document.getElementById("verifyBtn");
    const resendBtn = document.getElementById("resend-btn");
    const timer = document.getElementById("timer");
    const otpError = document.getElementById("otpError");
    const formMessage = document.getElementById("formMessage");
    const maskedEmail = document.getElementById("maskedEmail");

    const originalVerifyButtonHTML = verifyBtn.innerHTML;
    const originalResendButtonHTML = resendBtn.innerHTML;

    let countdownId = null;
    let secondsRemaining = OTP_LIFETIME_SECONDS;
    let verificationComplete = false;

    const storedEmail =
        sessionStorage.getItem("senkuVerifyEmail") ||
        localStorage.getItem("verifyEmail");

    const normalizeEmail = (value) =>
        String(value || "").trim().toLowerCase();

    const email = normalizeEmail(storedEmail);

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const maskEmail = (value) => {
        const [localPart, domain] = value.split("@");

        if (!localPart || !domain) {
            return "your email address";
        }

        const visibleStart = localPart.slice(0, Math.min(2, localPart.length));
        const hiddenLength = Math.max(localPart.length - visibleStart.length, 2);

        return `${visibleStart}${"*".repeat(hiddenLength)}@${domain}`;
    };

    const setFormMessage = (message = "", type = "error") => {
        if (!message) {
            formMessage.hidden = true;
            formMessage.textContent = "";
            formMessage.className = "form-message";
            return;
        }

        formMessage.hidden = false;
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
    };

    const setOtpError = (message = "") => {
        otpError.textContent = message;

        inputs.forEach((input) => {
            input.classList.toggle("invalid", Boolean(message));
            input.setAttribute("aria-invalid", String(Boolean(message)));
        });
    };

    const clearOtp = () => {
        inputs.forEach((input) => {
            input.value = "";
            input.classList.remove("filled", "invalid");
        });

        setOtpError("");
        inputs[0]?.focus();
    };

    const getOtp = () =>
        inputs.map((input) => input.value).join("");

    const fillOtp = (value) => {
        const digits = String(value)
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);

        inputs.forEach((input, index) => {
            input.value = digits[index] || "";
            input.classList.toggle("filled", Boolean(input.value));
        });

        const nextEmptyIndex = inputs.findIndex((input) => !input.value);

        if (nextEmptyIndex >= 0) {
            inputs[nextEmptyIndex].focus();
        } else {
            inputs[OTP_LENGTH - 1]?.focus();
        }

        setOtpError("");
    };

    const setVerifyLoading = (loading) => {
        verifyBtn.disabled = loading || verificationComplete;

        verifyBtn.innerHTML = loading
            ? `
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <span>Verifying...</span>
              `
            : originalVerifyButtonHTML;
    };

    const setResendLoading = (loading) => {
        resendBtn.disabled = loading || secondsRemaining > 0;

        resendBtn.innerHTML = loading
            ? `
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                Sending...
              `
            : originalResendButtonHTML;
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    };

    const stopTimer = () => {
        if (countdownId) {
            window.clearInterval(countdownId);
            countdownId = null;
        }
    };

    const renderTimer = () => {
        if (secondsRemaining <= 0) {
            timer.textContent = "Expired";
            timer.classList.add("expired");
            resendBtn.disabled = false;
            return;
        }

        timer.textContent = formatTime(secondsRemaining);
        timer.classList.remove("expired");
        resendBtn.disabled = true;
    };

    const startTimer = (duration = OTP_LIFETIME_SECONDS) => {
        stopTimer();

        secondsRemaining = duration;
        renderTimer();

        countdownId = window.setInterval(() => {
            secondsRemaining -= 1;
            renderTimer();

            if (secondsRemaining <= 0) {
                stopTimer();
            }
        }, 1000);
    };

    const parseResponseBody = async (response) => {
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            return response.json();
        }

        const text = await response.text();

        return {
            message: text || "Unexpected server response."
        };
    };

    const getServerMessage = (data, fallback) => {
        if (!data) return fallback;

        if (typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }

        if (typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }

        if (Array.isArray(data.errors) && data.errors.length) {
            return data.errors
                .map((item) =>
                    typeof item === "string"
                        ? item
                        : item.message || item.msg
                )
                .filter(Boolean)
                .join(" ");
        }

        return fallback;
    };

    if (!email || !isValidEmail(email)) {
        setFormMessage(
            "Your verification session is missing or expired. Please register again.",
            "error"
        );

        form.querySelectorAll("input, button").forEach((element) => {
            element.disabled = true;
        });

        window.setTimeout(() => {
            window.location.replace("register.html");
        }, 1800);

        return;
    }

    maskedEmail.textContent = maskEmail(email);

    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            const digits = input.value.replace(/\D/g, "");

            if (digits.length > 1) {
                fillOtp(digits);
                return;
            }

            input.value = digits.slice(0, 1);
            input.classList.toggle("filled", Boolean(input.value));
            setOtpError("");

            if (input.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
                inputs[index + 1].select();
            }
        });

        input.addEventListener("keydown", (event) => {
            if (event.key === "Backspace") {
                if (!input.value && index > 0) {
                    inputs[index - 1].focus();
                    inputs[index - 1].value = "";
                    inputs[index - 1].classList.remove("filled");
                }

                return;
            }

            if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                inputs[index - 1].focus();
            }

            if (event.key === "ArrowRight" && index < inputs.length - 1) {
                event.preventDefault();
                inputs[index + 1].focus();
            }

            if (
                event.key.length === 1 &&
                !/^\d$/.test(event.key)
            ) {
                event.preventDefault();
            }
        });

        input.addEventListener("focus", () => {
            input.select();
        });
    });

    otpContainer.addEventListener("paste", (event) => {
        event.preventDefault();

        const pastedValue =
            event.clipboardData?.getData("text") || "";

        fillOtp(pastedValue);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (verificationComplete || verifyBtn.disabled) return;

        const otp = getOtp();

        if (!/^\d{6}$/.test(otp)) {
            setOtpError("Enter the complete six-digit verification code.");
            inputs.find((input) => !input.value)?.focus();
            return;
        }

        setOtpError("");
        setFormMessage(
            "Checking your verification code...",
            "info"
        );
        setVerifyLoading(true);

        try {
            const response = await fetch(VERIFY_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email,
                    otp
                })
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                const message = getServerMessage(
                    data,
                    "The verification code is invalid or expired."
                );

                setFormMessage(message, "error");
                setVerifyLoading(false);
                clearOtp();
                return;
            }

            verificationComplete = true;
            stopTimer();

            sessionStorage.removeItem("senkuVerifyEmail");
            localStorage.removeItem("verifyEmail");

            setFormMessage(
                getServerMessage(
                    data,
                    "Your email has been verified successfully."
                ),
                "success"
            );

            verifyBtn.disabled = true;
            verifyBtn.innerHTML = `
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <span>Email Verified</span>
            `;
            verifyBtn.style.background =
                "linear-gradient(135deg,#16a34a,#22c55e)";

            inputs.forEach((input) => {
                input.disabled = true;
            });

            window.setTimeout(() => {
                window.location.replace("login.html");
            }, 1300);
        } catch (error) {
            console.error("Email verification request failed:", error);

            setFormMessage(
                "Unable to connect to the Senku Pay server. Please try again.",
                "error"
            );

            setVerifyLoading(false);
        }
    });

    resendBtn.addEventListener("click", async () => {
        if (resendBtn.disabled || verificationComplete) return;

        setOtpError("");
        setFormMessage(
            "Requesting a new verification code...",
            "info"
        );
        setResendLoading(true);

        try {
            const response = await fetch(RESEND_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    email
                })
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setFormMessage(
                    getServerMessage(
                        data,
                        "Unable to resend the verification code."
                    ),
                    "error"
                );

                secondsRemaining = 0;
                renderTimer();
                setResendLoading(false);
                return;
            }

            clearOtp();

            setFormMessage(
                getServerMessage(
                    data,
                    "A new verification code was sent to your email."
                ),
                "success"
            );

            resendBtn.innerHTML = originalResendButtonHTML;
            startTimer();
        } catch (error) {
            console.error("OTP resend request failed:", error);

            setFormMessage(
                "Unable to connect to the Senku Pay server. Please try again.",
                "error"
            );

            secondsRemaining = 0;
            renderTimer();
            setResendLoading(false);
        }
    });

    startTimer();
    inputs[0]?.focus();
});
