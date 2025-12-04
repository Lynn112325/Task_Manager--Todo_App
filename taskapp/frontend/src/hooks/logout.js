export async function logout() {
    await axios.post("/logout");
    sessionStorage.removeItem("currentUser");
}
