import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";import logo from '../recources/logo.png';

export default function Header() {
    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Box
                    component="img"
                    src={logo}
                    alt="Logo"
                    sx={{
                        height: 40,
                        width: "auto",
                        mr: 2,
                    }}
                />

                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    IoT Dashboard
                </Typography>

                <Box>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">About</Button>
                    <Button color="inherit">Contact</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
