import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Footer() {
    return (
        <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
            <Toolbar sx={{ justifyContent: "center" }}>
                <Typography variant="body2" color="inherit">
                    © {new Date().getFullYear()} IoT Dashboard. All rights reserved.
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
