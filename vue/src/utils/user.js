export async function loginFromDatabase(userData, token) {
    //Appel API qui va vérifier l'email et le mot de passe,
    //qui va faire expirer le token précédent s'il existe, et qui va générer un nouveau token pour la session actuelle
    //pour l'instant, on simule ça

    return new Promise((resolve) => {
        setTimeout(() => {
            const user = {
                id: "12345",
                email: "example@mail.com",
                name: "John Doe",
                role: "user",
                jour_expiration: 7
            };

            const token = "12345|aijeifeuuhé23455|user";

            Cookies.set("token", token, { expires: user.jour_expiration });
            Cookies.set("user", user, { expires: user.jour_expiration });
            
            resolve({ "user": user, "token": token });
        }, 1000);
    });
}

export async function logoutFromDatabase(token) {
    //Appel API qui va faire expirer le token actuel
    //pour l'instant, on simule ça

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
            Cookies.remove("token");
            Cookies.remove("user");
        }, 500);
    });
}