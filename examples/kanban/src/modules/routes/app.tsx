import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, withRouter } from "react-router-dom";
import { History } from "history";
import routes from "../routes";
import { useBus } from "ts-bus/react";
import { navigationRequested } from "./events";
import { createHref } from "./createHref";

type ManageRoutesProps = { children: React.ReactNode; history: History };

// Here we can link our router to event bus
const ManageRoutes = withRouter<any>(
  ({ children, history }: ManageRoutesProps) => {
    const { subscribe } = useBus();

    useEffect(() => {
      return subscribe(navigationRequested, event => {
        history.push(createHref(event.payload.to));
      });
    }, [subscribe, history]);

    return <>{children}</>;
  }
);

function App() {
  return (
    <Router>
      <ManageRoutes>
        {Object.entries(routes).map(([path, { exact = false, component }]) => (
          <Route key={path} path={path} exact={exact} component={component} />
        ))}
      </ManageRoutes>
    </Router>
  );
}

export default App;
