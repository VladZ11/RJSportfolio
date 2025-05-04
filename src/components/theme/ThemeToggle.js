import React, { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";
import { Tooltip, IconButton, Zoom } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Brightness4, Brightness7 } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    position: "fixed",
    bottom: theme.spacing(1),
    right: theme.spacing(1),  
    height: "2rem",
    width: "2rem",
    minHeight: "unset",       
    minWidth: "unset",      
    padding: 0,             
    zIndex: 1300,
  },
  icon: {
    fontSize: "1.25rem",
  },
}));



export const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const classes = useStyles();

    return (
      <Tooltip
        title={"Toggle theme"}
        placement="right"
        TransitionComponent={Zoom}
      >
        <IconButton
          color="inherit"
          onClick={toggleTheme}
          aria-label={"Toggle theme"}
          className={classes.iconButton}
        >
          {theme === "light" ? (
              <Brightness4 className={classes.icon} />
          ) : (
              <Brightness7 className={classes.icon} />
          )}
        </IconButton>
      </Tooltip>
    );
};
