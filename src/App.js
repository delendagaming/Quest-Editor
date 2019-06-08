import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./components/store";
import { UserIsAuthenticated, UserIsNotAuthenticated } from "./helpers/auth";

import "./App.css";

import AppNavbar from "./components/layout/AppNavbar";
import QuestEditorMenu from "./components/questeditor/QuestEditorMenu";
import NewQuest from "./components/questeditor/NewQuest";
import QuestsInProgress from "./components/questeditor/QuestsInProgress";
import QuestsSubmitted from "./components/questeditor/QuestsSubmitted";
import QuestBuilder from "./components/questeditor/questbuilder/QuestBuilder";
import QuestDetails from "./components/questeditor/QuestDetails";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import AppComponent from "./components/TestChildClick";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <AppNavbar />
            <Switch>
              <Route
                exact
                path="/login/"
                component={UserIsNotAuthenticated(Login)}
              />
              <Route
                exact
                path="/register/"
                component={UserIsNotAuthenticated(Register)}
              />
              <Route
                exact
                path="/questeditor/menu/"
                component={UserIsAuthenticated(QuestEditorMenu)}
              />
              <Route
                exact
                path="/questeditor/newquest/"
                component={UserIsAuthenticated(NewQuest)}
              />
              <Route
                exact
                path="/questeditor/inprogress/"
                component={UserIsAuthenticated(QuestsInProgress)}
              />
              <Route
                exact
                path="/questeditor/submitted/"
                component={UserIsAuthenticated(QuestsSubmitted)}
              />
              <Route
                exact
                path="/questeditor/builder/new"
                component={UserIsAuthenticated(QuestBuilder)}
              />
              <Route
                exact
                path="/questeditor/details/:id"
                component={UserIsAuthenticated(QuestDetails)}
              />
              <Route
                exact
                path="/appcomponent"
                component={UserIsAuthenticated(AppComponent)}
              />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
