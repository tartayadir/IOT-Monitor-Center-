import React from 'react';
import { Button, Stack } from '@mui/material';

const CommandButtons = ({ sendCommand, isDisabled }) => {
    const commands = [
        { targetComponent: 'lLight', command: 'ON' },
        { targetComponent: 'Light', command: 'OFF' },
        { targetComponent: 'Buzzer', command: 'ON' },
        { targetComponent: 'Buzzer', command: 'OFF' },
    ];

    const handleButtonClick = (targetComponent, command) => {
        sendCommand({ targetComponent, command }); // Send the command to the backend
    };

    return (
        <Stack spacing={2} direction="column" alignItems="center">
            {commands.map((cmd, index) => (
                <Button
                    disabled={isDisabled}
                    key={index}
                    variant="contained"
                    onClick={() => handleButtonClick(cmd.targetComponent, cmd.command)}
                >
                    {`${cmd.targetComponent.toUpperCase()} ${cmd.command}`}
                </Button>
            ))}
        </Stack>
    );
};

export default CommandButtons;