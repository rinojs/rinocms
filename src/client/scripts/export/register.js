document.addEventListener("DOMContentLoaded", function ()
{
    const USERNAME_REGEX = /^(?=.{5,50}$)(?!.*[._-]{2})[a-z](?:[a-z0-9._-]*[a-z0-9])$/;
    const EMAIL_REGEX = /^(?=.{6,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
    const PASSWORD_REGEX = /^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~])[A-Za-z0-9!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]{8,24}$/;
    const usernameInput = document.getElementById("username-input");
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("password-input");
    const confirmPasswordInput = document.getElementById("confirm-password-input");
    const form = document.getElementById('register-form');
    const formMessage = document.getElementById("form-msg");


    usernameInput.addEventListener("input", () =>
    {
        const username = usernameInput.value;

        if (!USERNAME_REGEX.test(username))
        {
            formMessage.textContent = `
            ❌ Username must be 5–50 characters,
            start with a–z, use only a–z, 0–9, ., _, -,
            can’t end with ., _, -,
            and can’t have two or more special characters in a row.
            `
            formMessage.style.color = "red";
            return;
        }
        else
        {
            formMessage.textContent = "✅ Good username";
            formMessage.style.color = "green";
        }
    });

    emailInput.addEventListener("input", () =>
    {
        const email = emailInput.value;
        if (email && !EMAIL_REGEX.test(email))
        {
            formMessage.textContent = `
                ❌ Email must be 6–254 characters;
                the part before “@” ≤ 64;
                use only English letters (a–z, A–Z), digits (0–9),
                and these symbols ! # $ % & ' * + / = ? ^ _ \ { | } ~\`;
                dots may separate parts (no leading / trailing dot and no “..”);
                domain must be letters / digits with hyphens only inside labels,
                include at least one dot,
                and end with a letter - only TLD(2–63 chars).
            `;
            formMessage.style.color = "red";
            return;
        }
        else
        {
            formMessage.textContent = "";
            return;
        }
    })

    async function checkPassword()
    {
        const pw = passwordInput.value;
        const cpw = confirmPasswordInput.value;

        if (!PASSWORD_REGEX.test(pw))
        {
            formMessage.textContent = "❌ Password must be 8–24 characters and include at least one special character.";
            formMessage.style.color = "red";
            return;
        }
        else if (!cpw)
        {
            formMessage.textContent = "";
            return;
        }
        else if (pw === cpw)
        {
            formMessage.textContent = "✅ Passwords match";
            formMessage.style.color = "green";
        }
        else
        {
            formMessage.textContent = "❌ Passwords do not match";
            formMessage.style.color = "red";
        }
    }

    passwordInput.addEventListener("input", checkPassword);
    confirmPasswordInput.addEventListener("input", checkPassword);


    form.addEventListener('submit', function (e)
    {
        const username = usernameInput.value;
        const email = emailInput.value;
        const pw = passwordInput.value;
        const cpw = confirmPasswordInput.value;

        if (!USERNAME_REGEX.test(username))
        {
            e.preventDefault();
            alert("❌ Username must be 5–50 characters, start with a–z, use only a–z, 0–9, ., _, -, can’t end with ., _, -, and can’t have two or more special characters in a row.");
        }
        else if (!EMAIL_REGEX.test(email))
        {
            e.preventDefault();
            alert(`
            ❌ Email must be 6–254 characters;
            the part before “@” ≤ 64; use letters or numbers (international OK)
            and these symbols ! # $ % & ' * + / = ? ^ _ \ { | } ~\`;
            dots may separate parts (no leading / trailing dot and no “..”);
            domain must be letters / numbers,
            may use hyphens only inside labels, and include at least one dot.
                `);
        }
        else if (!PASSWORD_REGEX.test(pw))
        {
            e.preventDefault();
            alert("❌ Password must be 8–24 characters and include at least one special character.");
        }
        else if (pw !== cpw)
        {
            e.preventDefault();
            alert("❌ Passwords do not match.");
        }
    });
});