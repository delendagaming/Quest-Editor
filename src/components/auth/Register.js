import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { firebaseConnect } from "react-redux-firebase";
import { notifyUser } from "../../actions/notifyActions";
import Alert from "../layout/Alert";
import { CryptoUtils, LocalAddress } from "loom-js";

import React, { Component } from "react";

class Register extends Component {
  state = {
    email: "",
    password: "",
    accountName: ""
  };

  onChange = e => this.setState({ [e.target.name]: e.target.value });
  onSubmit = async e => {
    e.preventDefault();
    const { firebase, notifyUser } = this.props;
    const { email, password, accountName } = this.state;

    // Generate random private key and associated address for user

    const privateKeyLoom = CryptoUtils.generatePrivateKey();
    const loomPublicKey = CryptoUtils.publicKeyFromPrivateKey(privateKeyLoom);
    const loomAddress = LocalAddress.fromPublicKey(loomPublicKey).toString();

    console.log(loomAddress);

    //Register with firebase
    await firebase
      .createUser({ email, password })
      .catch(err => notifyUser("That User Already Exists", "error-register"));
    var user = await firebase.auth().currentUser;
    if (user) {
      await user.updateProfile({
        displayName: accountName,
        photoURL: loomAddress
      });
      console.log(user);
      this.props.history.push("/questeditor/menu/");
    }
  };

  render() {
    const { message, messageType } = this.props.notify;

    return (
      <div
        className="container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -40%)",
          marginTop: "-50px"
        }}
      >
        <div className="row">
          <div className="col-md-4 mx-auto">
            <div className="card card-register">
              <div className="card-body">
                {messageType === "error-register" ? (
                  <Alert message={message} messageType={messageType} />
                ) : null}
                <h1 className="text-center pb-4 pt-3">
                  <span className="text-secondary">
                    <i className="fa fa-user-circle" /> Register
                  </span>
                </h1>
                <form onSubmit={this.onSubmit}>
                  <div className="form-group">
                    <label htmlFor="accountName">Account Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="accountName"
                      required
                      value={this.state.accountName}
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      required
                      value={this.state.email}
                      onChange={this.onChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      minLength="6"
                      required
                      value={this.state.password}
                      onChange={this.onChange}
                    />
                  </div>
                  <input
                    type="submit"
                    value="Register"
                    className="btn btn-dark btn-block"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTyopes = {
  firebase: PropTypes.object.isRequired,
  notify: PropTypes.object.isRequired,
  notifyUser: PropTypes.func.isRequired
};

export default compose(
  firebaseConnect(),
  connect(
    (state, props) => ({
      notify: state.notify
    }),
    { notifyUser }
  )
)(Register);
