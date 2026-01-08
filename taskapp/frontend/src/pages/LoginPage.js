import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import qs from "qs";
import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "../axiosConfig";
import { useAuth } from "../context/UserContext";
import useNotifications from "../hooks/useNotifications/useNotifications";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";

const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    [theme.breakpoints.up("sm")]: {
        maxWidth: "450px",
    },
    boxShadow:
        "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    ...theme.applyStyles("dark", {
        boxShadow:
            "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
    height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
    minHeight: "100%",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(4),
    },
    "&::before": {
        content: '""',
        display: "block",
        position: "absolute",
        zIndex: -1,
        inset: 0,
        backgroundImage:
            "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
        backgroundRepeat: "no-repeat",
        ...theme.applyStyles("dark", {
            backgroundImage:
                "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
        }),
    },
}));

export default function SignIn(props) {
    const [usernameError, setUsernameError] = React.useState(false);
    const [usernameErrorMessage, setUsernameErrorMessage] = React.useState("");
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const notifications = useNotifications();
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    useEffect(() => {
        // get CSRF token from the backend when user visits the login page
        const initSession = async () => {
            try {
                await axios.get('/api/csrf');
                // console.log("CSRF cookie should be set:", document.cookie);
            } catch (err) {
                // Silently handle the error for the initial CSRF fetch
                console.log("CSRF initialized (checking existing session)");
            }
        };
        initSession();
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // setTimeout(() => {
        //     document.getElementById("mainAddButton")?.focus();
        // }, 300);
    };

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) {
            return;
        }

        const data = new FormData(e.currentTarget);
        const username = data.get("username");
        const password = data.get("password");
        // console.log("Submitting:", { username, password });

        try {
            const res = await axios.post("/login", qs.stringify({ username, password }),
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            if (res.data.status === "ok") {
                navigate("/tasks/todo");
                // Fetching user details to update global context
                const userData = await fetchUser();

                if (userData) {
                    // 3. Navigate only after Context is updated
                    // English: Ensure ProtectedRoute sees the user before navigating
                    navigate("/tasks/todo");
                }
            }
        } catch (error) {
            notifications.show("Invalid username or password", {
                severity: "error",
                autoHideDuration: 3000,
            });
            document.getElementById("password").value = "";
            document.getElementById("password").focus();
        }
    };

    // Function to validate inputs
    const validateInputs = () => {
        const username = document.getElementById("username");
        const password = document.getElementById("password");

        let isValid = true;

        if (!username.value || password.value.length < 0) {
            setUsernameError(true);
            setUsernameErrorMessage("Please enter a valid username.");
            isValid = false;
        } else {
            setUsernameError(false);
            setUsernameErrorMessage("");
        }

        if (!password.value || password.value.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage("Password must be at least 6 characters long.");
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage("");
        }

        return isValid;
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <SignInContainer direction="column" justifyContent="space-between">
                <ColorModeSelect
                    sx={{ position: "fixed", top: "1rem", right: "1rem" }}
                />
                <Card variant="outlined">
                    <img
                        src="/img/logo.png"
                        alt="Logo"
                        style={{
                            height: 40,
                            marginLeft: 3,
                            marginRight: 3,
                            width: "auto",
                            flexShrink: 0,
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                    <Divider variant="middle" />
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
                    >
                        Sign in
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        // method="POST"
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                            gap: 2,
                        }}
                    >
                        <FormControl>
                            <FormLabel htmlFor="username">username</FormLabel>
                            <TextField
                                error={usernameError}
                                helperText={usernameErrorMessage}
                                id="username"
                                type="username"
                                name="username"
                                placeholder="username"
                                autoComplete="username"
                                // default
                                value={"Lynn"}
                                autoFocus
                                required
                                fullWidth
                                variant="outlined"
                                color={usernameError ? "error" : "primary"}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <TextField
                                error={passwordError}
                                helperText={passwordErrorMessage}
                                name="password"
                                placeholder="••••••••"
                                // default
                                value={"lynn01"}
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                required
                                fullWidth
                                variant="outlined"
                                color={passwordError ? "error" : "primary"}
                            />
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            onClick={validateInputs}
                        >
                            Sign in
                        </Button>
                        {/* <Link
                            component="button"
                            type="button"
                            onClick={handleClickOpen}
                            variant="body2"
                            sx={{ alignSelf: "center" }}
                        >
                            Forgot your password?
                        </Link> */}
                    </Box>
                    <Divider>or</Divider>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography sx={{ textAlign: "center" }}>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/#/signup"
                                variant="body2"
                                sx={{ alignSelf: "center" }}
                            >
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </SignInContainer>
        </AppTheme>
    );
}
