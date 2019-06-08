import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firebaseConnect } from "react-redux-firebase";
import { notifyUser } from "../../actions/notifyActions";

class AppNavbar extends Component {
  state = {
    isAuthenticated: false
  };

  static getDerivedStateFromProps(props, state) {
    const { auth } = props;
    if (auth.uid) {
      return { isAuthenticated: true };
    } else {
      return { isAuthenticated: false };
    }
  }

  onLogoutClick = async e => {
    e.preventDefault();
    const { firebase, notifyUser } = this.props;
    const { message, messageType } = this.props.notify;
    if (message || messageType) {
      await notifyUser(null, null);
    }
    firebase.logout();
  };

  render() {
    const { isAuthenticated } = this.state;
    const { auth } = this.props;
    return (
      <div>
        <nav className="navbar navbar-expand-md bg-dark mb-2">
          <div className="container">
            <Link to="/home" className="navbar-brand text-light">
              Home
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarMain"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarMain">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-light"
                    href="#"
                    id="dropdown03"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Players
                  </a>
                  <div className="dropdown-menu" aria-labelledby="dropdown03">
                    <Link
                      to="/playerprofile"
                      className="dropdown-item text-dark"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/playerranking"
                      className="dropdown-item text-dark"
                    >
                      Ranking
                    </Link>
                    <Link to="/playerforum" className="dropdown-item text-dark">
                      Forum
                    </Link>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-light"
                    href="#"
                    id="dropdown03"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Scribes
                  </a>
                  <div className="dropdown-menu" aria-labelledby="dropdown03">
                    <Link
                      to="/questeditor/menu/"
                      className="dropdown-item text-dark"
                    >
                      Quest Editor
                    </Link>
                    <Link
                      to="/scribeprofile"
                      className="dropdown-item text-dark"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/scriberanking"
                      className="dropdown-item text-dark"
                    >
                      Ranking
                    </Link>
                    <Link to="/scribeforum" className="dropdown-item text-dark">
                      Forum
                    </Link>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <Link to="/marketplace" className="nav-link text-light">
                    Marketplace
                  </Link>
                </li>
              </ul>

              {isAuthenticated ? (
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <a href="#!" className="nav-link text-light">
                      {auth.email}
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      href="#!"
                      className="nav-link text-light"
                      onClick={this.onLogoutClick}
                    >
                      Logout
                    </a>
                  </li>
                </ul>
              ) : null}
              {!isAuthenticated ? (
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link to="/login" className="nav-link text-light">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link text-light">
                      Register
                    </Link>
                  </li>
                </ul>
              ) : null}
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

AppNavbar.propTypes = {
  firebase: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  notify: PropTypes.object.isRequired,
  notifyUser: PropTypes.func.isRequired
};

export default compose(
  firebaseConnect(),
  connect(
    (state, props) => ({
      auth: state.firebase.auth,
      notify: state.notify
    }),
    { notifyUser }
  )
)(AppNavbar);
