/*==================================================
    SENKU PAY
    LOGIN PAGE
==================================================*/

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://senkupay-api.onrender.com";
    const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

    const form = document.getElementById("loginForm");
    const identifier = document.getElementById("loginIdentifier");
    const password = document.getElementById("password");
    const remember = document.getElementById("rememberMe");
    const loginBtn = document.getElementById("loginBtn");
    const passwordToggle = document.getElementById("passwordToggle");
    const formMessage = document.getElementById("formMessage");
    const identifierError = document.getElementById("identifierError");
    const passwordError = document.getElementById("passwordError");

    const originalButtonHTML = loginBtn.innerHTML;

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

    const setFieldError = (field, errorElement, message = "") => {
        errorElement.textContent = message;
        field.classList.toggle("invalid", Boolean(message));
        field.setAttribute("aria-invalid", String(Boolean(message)));
    };

    const clearErrors = () => {
        setFormMessage("");
        setFieldError(identifier, identifierError, "");
        setFieldError(password, passwordError, "");
    };

    const setLoading = (loading) => {
        loginBtn.disabled = loading;

        loginBtn.innerHTML = loading
            ? `
                <i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
                <span>Signing In...</span>
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

    const decodeJwtPayload = (token) => {
        try {
            const payload = token.split(".")[1];

            if (!payload) return null;

            const normalized = payload
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const decoded = decodeURIComponent(
                atob(normalized)
                    .split("")
                    .map(
                        (character) =>
                            `%${character.charCodeAt(0)
                                .toString(16)
                                .padStart(2, "0")}`
                    )
                    .join("")
            );

            return JSON.parse(decoded);
        } catch {
            return null;
        }
    };

    const getUserRole = (data, token) => {
        const roleFromResponse =
            data?.user?.role ||
            data?.account?.role ||
            data?.role;

        if (roleFromResponse) {
            return String(roleFromResponse).toUpperCase();
        }

        const payload = decodeJwtPayload(token);

        return String(
            payload?.role ||
            payload?.userRole ||
            "USER"
        ).toUpperCase();
    };

    const getRedirectForRole = (role) => {
        switch (role) {
            case "ADMIN":
            case "SUPER_ADMIN":
                return "admin-dashboard.html";

            case "AGENT":
                return "admin-dashboard.html";

            case "SUB_AGENT":
                return "sub-agent-dashboard.html";

            case "USER":
            default:
                return "dashboard.html";
        }
    };

    const storeSession = (data, token, shouldRemember) => {
        const storage = shouldRemember
            ? localStorage
            : sessionStorage;

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        sessionStorage.removeItem("currentUser");

        storage.setItem("token", token);

        const user =
            data?.user ||
            data?.account ||
            null;

        if (user) {
            storage.setItem(
                "currentUser",
                JSON.stringify(user)
            );
        }

        localStorage.setItem(
            "rememberLogin",
            String(shouldRemember)
        );

        if (shouldRemember) {
            localStorage.setItem(
                "rememberedIdentifier",
                identifier.value.trim()
            );
        } else {
            localStorage.removeItem("rememberedIdentifier");
        }
    };

    passwordToggle.addEventListener("click", () => {
        const showPassword = password.type === "password";
        const icon = passwordToggle.querySelector("i");

        password.type = showPassword ? "text" : "password";

        icon.classList.toggle("fa-eye", !showPassword);
        icon.classList.toggle("fa-eye-slash", showPassword);

        passwordToggle.setAttribute(
            "aria-label",
            showPassword ? "Hide password" : "Show password"
        );
    });

    identifier.addEventListener("input", () => {
        setFieldError(identifier, identifierError, "");
        setFormMessage("");
    });

    password.addEventListener("input", () => {
        setFieldError(password, passwordError, "");
        setFormMessage("");
    });

    const rememberEnabled =
        localStorage.getItem("rememberLogin") === "true";

    if (rememberEnabled) {
        remember.checked = true;

        const rememberedIdentifier =
            localStorage.getItem("rememberedIdentifier");

        if (rememberedIdentifier) {
            identifier.value = rememberedIdentifier;
        }
    }

    remember.addEventListener("change", () => {
        localStorage.setItem(
            "rememberLogin",
            String(remember.checked)
        );

        if (!remember.checked) {
            localStorage.removeItem("rememberedIdentifier");
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (loginBtn.disabled) return;

        clearErrors();

        const identifierValue = identifier.value.trim();
        const passwordValue = password.value;

        let isValid = true;

        if (!identifierValue) {
            setFieldError(
                identifier,
                identifierError,
                "Enter your username or email address."
            );
            isValid = false;
        }

        if (!passwordValue) {
            setFieldError(
                password,
                passwordError,
                "Enter your password."
            );
            isValid = false;
        }

        if (!isValid) {
            setFormMessage(
                "Enter your login details and try again.",
                "error"
            );

            if (!identifierValue) {
                identifier.focus();
            } else {
                password.focus();
            }

            return;
        }

        setLoading(true);
        setFormMessage(
            "Signing in to your Senku Pay account...",
            "info"
        );

        try {
            const response = await fetch(LOGIN_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    username: identifierValue,
                    password: passwordValue
                })
            });

            const data = await parseResponseBody(response);

            if (!response.ok) {
                setFormMessage(
                    getServerMessage(
                        data,
                        "The username, email or password is incorrect."
                    ),
                    "error"
                );

                setLoading(false);
                password.focus();
                password.select();
                return;
            }

            const token =
                data?.token ||
                data?.accessToken ||
                data?.access_token;

            if (!token) {
                setFormMessage(
                    "Login succeeded, but the server did not return an authentication token.",
                    "error"
                );

                setLoading(false);
                return;
            }

            const role = getUserRole(data, token);
            const redirectUrl = getRedirectForRole(role);

            storeSession(data, token, remember.checked);

            setFormMessage(
                getServerMessage(
                    data,
                    "Login successful. Redirecting to your dashboard..."
                ),
                "success"
            );

            loginBtn.innerHTML = `
                <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
                <span>Login Successful</span>
            `;

            window.setTimeout(() => {
                window.location.replace(redirectUrl);
            }, 900);
        } catch (error) {
            console.error("Login request failed:", error);

            setFormMessage(
                "Unable to connect to the Senku Pay server. Please check your connection and try again.",
                "error"
            );

            setLoading(false);
        }
    });

    const existingToken =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

    if (existingToken) {
        const payload = decodeJwtPayload(existingToken);
        const expiry = Number(payload?.exp || 0) * 1000;

        if (expiry && expiry <= Date.now()) {
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            sessionStorage.removeItem("currentUser");
        }
    }
});
