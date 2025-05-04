import React, { lazy, Suspense } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { HelmetMeta } from "./HelmetMeta";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { CssBaseline } from "@material-ui/core";
import { logCredits } from "../utils/logCredits";
import { Home } from "../pages/Home";

// Changed to HashRouter for GitHub Pages compatibility
// Lazy loaded components
const Resume = lazy(() => import("../pages/Resume"));
const PageNotFound = lazy(() => import("../pages/PageNotFound"));

export const App = () => {
    logCredits();

    return (
      <ThemeProvider>
        <CssBaseline />
        <Router>
          <HelmetMeta />
          <Switch>
              <Route path="/" exact component={Home} />
              <Suspense fallback={<div>Loading...</div>}>
                <Route path="/resume" component={Resume} />
                <Route path="*" component={PageNotFound} />
              </Suspense>
          </Switch>
        </Router>
      </ThemeProvider>
    );
};