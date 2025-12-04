import * as React from "react";

import { alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import AppNavbar from "./components/AppNavbar";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import AppTheme from "../shared-theme/AppTheme";
import DialogsProvider from "./hooks/useDialogs/DialogsProvider";
import NotificationsProvider from "./hooks/useNotifications/NotificationsProvider";
import { Outlet } from "react-router-dom";

import {
    dataGridCustomizations,
    datePickersCustomizations,
    sidebarCustomizations,
    formInputCustomizations,
} from "../shared-theme/customizations";

const themeComponents = {
    ...dataGridCustomizations,
    ...datePickersCustomizations,
    ...sidebarCustomizations,
    ...formInputCustomizations,
};

export default function HomePage(props) {
    return (
        <AppTheme {...props} themeComponents={themeComponents}>
            <CssBaseline enableColorScheme />{" "}
            <NotificationsProvider>
                <DialogsProvider>
                    <Box sx={{ display: "flex" }}>
                        <SideMenu />
                        <AppNavbar />
                        {/* Main content */}
                        <Box
                            component="main"
                            sx={(theme) => ({
                                flexGrow: 1,
                                backgroundColor: theme.vars
                                    ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                                    : alpha(theme.palette.background.default, 1),
                                overflow: "auto",
                            })}
                        >
                            <Stack
                                spacing={2}
                                sx={{
                                    alignItems: "center",
                                    mx: 3,
                                    pb: 5,
                                    mt: { xs: 8, md: 0 },
                                }}
                            >
                                <Header />
                                {/* <MainGrid /> */}
                                <Outlet />
                                
                            </Stack>
                        </Box>
                    </Box>
                </DialogsProvider>
            </NotificationsProvider>
        </AppTheme>
    );
}
