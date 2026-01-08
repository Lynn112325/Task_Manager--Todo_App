import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import Divider, { dividerClasses } from '@mui/material/Divider';
import { listClasses } from '@mui/material/List';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import MenuButton from './MenuButton';

// Import your Auth context hook
import { useAuth } from '../context/UserContext';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu() {
  // Extract logout function from context
  const { logout } = useAuth();

  // anchorEl holds the HTML element that the menu is "anchored" to
  const [anchorEl, setAnchorEl] = React.useState(null);
  // If anchorEl is not null, 'open' will be true
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    // event.currentTarget is the DOM element of the button you clicked
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // Setting anchorEl back to null hides the menu
    setAnchorEl(null);
  };

  /**
   * Handle logout click
   */
  const handleLogout = async () => {
    handleClose(); // Close the menu first
    try {
      await logout(); // Execute the logout logic from Context
      // The ProtectedRoute in App.js will automatically redirect to /login
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <React.Fragment>
      <MenuButton
        aria-label="Open menu"
        onClick={handleClick}
        sx={{ borderColor: 'transparent' }}
      >
        <MoreVertRoundedIcon />
      </MenuButton>
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: { padding: '4px' },
          [`& .${paperClasses.root}`]: { padding: 0 },
          [`& .${dividerClasses.root}`]: { margin: '4px -4px' },
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>Add another account</MenuItem>
        <MenuItem onClick={handleClose}>Settings</MenuItem>
        <Divider />

        {/* Updated Logout MenuItem */}
        <MenuItem
          onClick={handleLogout} // Bind the logout handler here
          sx={{
            [`& .${listItemIconClasses.root}`]: {
              ml: 'auto',
              minWidth: 0,
            },
          }}
        >
          <ListItemText>Logout</ListItemText>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}