/*==================================================
    SENKU PAY
    REGISTER PAGE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://senkupay-api.onrender.com";
    const REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;

    const form = document.getElementById("registerForm");
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const country = document.getElementById("country");
    const referral = document.getElementById("referral");
    const terms = document.getElementById("terms");
    const registerBtn = document.getElementById("registerBtn");
    const formMessage = document.getElementById("formMessage");
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    const fields = {
        firstName,
        lastName,
        email,
        username,
        password,
        confirmPassword,
        country,
        referral,
        terms
    };

    const errorElements = {
        firstName: document.getElementById("firstNameError"),
        lastName: document.getElementById("lastNameError"),
        email: document.getElementById("emailError"),
        username: document.getElementById("usernameError"),
        password: document.getElementById("passwordError"),
        confirmPassword: document.getElementById("confirmPasswordError"),
        country: document.getElementById("countryError"),
        referral: document.getElementById("referralError"),
        terms: document.getElementById("termsError")
    };

    const originalButtonHTML = registerBtn.innerHTML;

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
        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    };

    const setFieldError = (fieldName, message = "") => {
        const field = fields[fieldName];
        const errorElement = errorElements[fieldName];

        if (errorElement) {
            errorElement.textContent = message;
        }

        if (field && field !== terms) {
            field.classList.toggle("invalid", Boolean(message));
            field.setAttribute("aria-invalid", String(Boolean(message)));
        }
    };

    const clearAllErrors = () => {
        Object.keys(errorElements).forEach((fieldName) => {
            setFieldError(fieldName, "");
        });

        setFormMessage("");
    };

    const normalizeUsername = (value) =>
        value.trim().replace(/\s+/g, "");

    const isValidName = (value) =>
        /^[\p{L}\p{M}' -]{2,60}$/u.test(value.trim());

    const isValidUsername = (value) =>
        /^[A-Za-z0-9_]{3,30}$/.test(value);

    const getPasswordStrength = (value) => {
        let score = 0;

        if (value.length >= 8) score += 1;
        if (value.length >= 12) score += 1;
        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
        if (/\d/.test(value)) score += 1;
        if (/[^A-Za-z0-9]/.test(value)) score += 1;

        return Math.min(score, 4);
    };

    const updatePasswordStrength = () => {
        const value = password.value;
        const score = getPasswordStrength(value);

        const strengthStates = [
            {
                width: "0%",
                color: "#ff647c",
                text: "Use at least 8 characters with letters and numbers."
            },
            {
                width: "25%",
                color: "#ff647c",
                text: "Password strength: weak"
            },
            {
                width: "50%",
                color: "#f7b731",
                text: "Password strength: fair"
            },
            {
                width: "75%",
                color: "#00d5ff",
                text: "Password strength: good"
            },
            {
                width: "100%",
                color: "#2ed573",
                text: "Password strength: strong"
            }
        ];

        const state = value
            ? strengthStates[score]
            : strengthStates[0];

        strengthBar.style.width = state.width;
        strengthBar.style.background = state.color;
        strengthText.textContent = state.text;
    };

    const validateForm = () => {
        clearAllErrors();

        let isValid = true;
        let firstInvalidField = null;

        const firstNameValue = firstName.value.trim();
        const lastNameValue = lastName.value.trim();
        const emailValue = email.value.trim().toLowerCase();
        const usernameValue = normalizeUsername(username.value);
        const passwordValue = password.value;
        const confirmPasswordValue = confirmPassword.value;
        const referralValue = referral.value.trim();

        username.value = usernameValue;
        email.value = emailValue;
        referral.value = referralValue;

        const invalidate = (fieldName, message) => {
            setFieldError(fieldName, message);
            isValid = false;

            if (!firstInvalidField) {
                firstInvalidField = fields[fieldName];
            }
        };

        if (!firstNameValue) {
            invalidate("firstName", "Enter your first name.");
        } else if (!isValidName(firstNameValue)) {
            invalidate(
                "firstName",
                "Use letters, spaces, apostrophes or hyphens only."
            );
        }

        if (!lastNameValue) {
            invalidate("lastName", "Enter your last name.");
        } else if (!isValidName(lastNameValue)) {
            invalidate(
                "lastName",
                "Use letters, spaces, apostrophes or hyphens only."
            );
        }

        if (!emailValue) {
            invalidate("email", "Enter your email address.");
        } else if (!email.checkValidity()) {
            invalidate("email", "Enter a valid email address.");
        }

        if (!usernameValue) {
            invalidate("username", "Choose a username.");
        } else if (!isValidUsername(usernameValue)) {
            invalidate(
                "username",
                "Use 3–30 letters, numbers or underscores."
            );
        }

        if (!passwordValue) {
            invalidate("password", "Create a password.");
        } else if (passwordValue.length < 8) {
            invalidate(
                "password",
                "Password must contain at least 8 characters."
            );
        } else if (!/[A-Za-z]/.test(passwordValue) || !/\d/.test(passwordValue)) {
            invalidate(
                "password",
                "Password must include at least one letter and one number."
            );
        }

        if (!confirmPasswordValue) {
            invalidate(
                "confirmPassword",
                "Confirm your password."
            );
        } else if (passwordValue !== confirmPasswordValue) {
            invalidate(
                "confirmPassword",
                "Passwords do not match."
            );
        }

        if (!country.value) {
            invalidate("country", "Select your country.");
        }

        if (
            referralValue &&
            !/^[A-Za-z0-9_-]{2,50}$/.test(referralValue)
        ) {
            invalidate(
                "referral",
                "Referral code contains unsupported characters."
            );
        }

        if (!terms.checked) {
            invalidate(
                "terms",
                "Accept the Terms of Service and Privacy Policy."
            );
        }

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return isValid;
    };

    const setLoading = (loading) => {
        registerBtn.disabled = loading;

        registerBtn.innerHTML = loading
            ? `
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <span>Creating Account...</span>
              `
            : originalButtonHTML;
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

    const extractServerMessage = (data, fallback) => {
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

    document
        .querySelectorAll(".password-toggle")
        .forEach((button) => {
            button.addEventListener("click", () => {
                const targetId = button.dataset.target;
                const target = document.getElementById(targetId);
                const icon = button.querySelector("i");

                if (!target || !icon) return;

                const showPassword = target.type === "password";

                target.type = showPassword ? "text" : "password";
                icon.classList.toggle("fa-eye", !showPassword);
                icon.classList.toggle("fa-eye-slash", showPassword);

                button.setAttribute(
                    "aria-label",
                    showPassword
                        ? "Hide password"
                        : "Show password"
                );
            });
        });

    password.addEventListener("input", () => {
        updatePasswordStrength();
        setFieldError("password", "");

        if (confirmPassword.value) {
            setFieldError(
                "confirmPassword",
                password.value === confirmPassword.value
                    ? ""
                    : "Passwords do not match."
            );
        }
    });

    confirmPassword.addEventListener("input", () => {
        setFieldError(
            "confirmPassword",
            confirmPassword.value &&
            password.value !== confirmPassword.value
                ? "Passwords do not match."
                : ""
        );
    });

    username.addEventListener("input", () => {
        const sanitized = username.value
            .replace(/\s+/g, "")
            .replace(/[^A-Za-z0-9_]/g, "");

        if (username.value !== sanitized) {
            username.value = sanitized;
        }

        setFieldError("username", "");
    });

    email.addEventListener("input", () => {
        setFieldError("email", "");
    });

    firstName.addEventListener("input", () => {
        setFieldError("firstName", "");
    });

    lastName.addEventListener("input", () => {
        setFieldError("lastName", "");
    });

    country.addEventListener("change", () => {
        setFieldError("country", "");
    });

    referral.addEventListener("input", () => {
        setFieldError("referral", "");
    });

    terms.addEventListener("change", () => {
        setFieldError("terms", "");
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (registerBtn.disabled) return;

        if (!validateForm()) {
            setFormMessage(
                "Review the highlighted fields and try again.",
                "error"
            );
            return;
        }

        setLoading(true);
        setFormMessage(
            "Creating your account and requesting an email verification code...",
            "info"
        );

        const payload = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim().toLowerCase(),
            username: normalizeUsername(username.value),
            password: password.value,
            country: country.value,
            referralCode: referral.value.trim() || undefined
        };

        /*
         * The existing backend route is:
         * POST https://senkupay-api.onrender.com/api/auth/register
         *
         * Core fields are preserved exactly:
         * firstName, lastName, email, username and password.
         *
         * country and referralCode are included for backend readiness.
         * A backend that ignores unknown JSON properties will continue
         * registering normally.
         */
        try {
            const response = await fetch(REGISTER_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                const message = extractServerMessage(
                    data,
                    "Registration failed. Please review your details."
                );

                setFormMessage(message, "error");
                setLoading(false);
                return;
            }

            sessionStorage.setItem(
                "senkuVerifyEmail",
                payload.email
            );

            /*
             * Compatibility with the existing verify-email page.
             * This can be removed later after that page is upgraded.
             */
            localStorage.setItem(
                "verifyEmail",
                payload.email
            );

            setFormMessage(
                extractServerMessage(
                    data,
                    "Account created. A verification code was sent to your email."
                ),
                "success"
            );

            registerBtn.innerHTML = `
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <span>Verification Sent</span>
            `;

            window.setTimeout(() => {
                window.location.replace("verify-email.html");
            }, 1200);
        } catch (error) {
            console.error("Registration request failed:", error);

            setFormMessage(
                "Unable to connect to the Senku Pay server. Please check your connection and try again.",
                "error"
            );

            setLoading(false);
        }
    });

    updatePasswordStrength();
});
