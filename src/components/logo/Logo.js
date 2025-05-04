import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  svgHover: {
    width: "100%",
    height: "100%",
    transition: "all 0.5s ease",
    "&:hover": {
      filter: "brightness(1.2)",
    },
  },
}));

export const Logo = () => {
  const classes = useStyles();
  const theme = useTheme();
  const logoSrc =
    theme.palette.type === "dark"
      ? process.env.PUBLIC_URL + "/vz-logo-dark.svg"
      : process.env.PUBLIC_URL + "/vz-logo-light.svg";

  return (
    <img
      src={logoSrc}
      alt="Logo"
      className={classes.svgHover}
    />
  );
};
