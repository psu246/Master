var React = require('react');
var firebase = require('firebase');
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;

var SignUpForm = React.createClass({

	//initially, no submission errors
	getInitialState: function(){
		return{hasError: false};
	},

	handleSignUp: function(){
		var that = this;

		//gets the data from the form fields
		var recruiter = this.state.recruiter == "true" ? true : false;
		var firstName = this.refs.firstName.value;
		var lastName = this.refs.lastName.value;
		var email = this.refs.email.value;
		var password = this.refs.password.value;
		var password_confirmation = this.refs.password_confirmation.value;
		
		if(firstName && lastName){
			//creates the user on firebase
			firebase.auth().createUserWithEmailAndPassword(email, password == password_confirmation ? password : "nil").catch(function(error) {
				if(error){
					that.setState({hasError: true});
					that.setState({errorMsg: "Please enter a valid email address with a password of at least 6 characters."});
				}
			});
		}else{
			that.setState({hasError: true});
			that.setState({errorMsg: "First or last name field cannot be empty."})
		}

		//if successfully logged in, add the user child to the database with the name and email.
		firebase.auth().onAuthStateChanged(function(user) {
  			if (user) {
  				console.log("Signed up!");
  				var userData = {
  					email: email,
  					first: firstName,
  					last: lastName,
  					recruiter: recruiter
  				};

  				firebase.database().ref('users/' + firebase.auth().currentUser.uid).set(userData);

  				//update display name for user
				user.updateProfile({
					displayName: firstName + " " + lastName,
				}).then(function(){
					console.log("success");
				},function(error){
					console.log("failure");
				});

				hashHistory.push("/");
  			}
		});
	},

	//if "Enter" was pressed, act as Sign Up was clicked
	handleKeyPress: function(e){
		if(e.key == 'Enter'){
			try{
				this.handleSignUp();
			}
			catch(e){};
		}
	},

	//sets the recruiter state true or false depending on the radio button
	accountChange: function(e){
		this.setState({recruiter: e.target.value});
	},

	//creates a div alert-danger with the error message
	errorMessage: function(){
		return <div className="alert alert-danger"><strong>Error! </strong>{this.state.errorMsg}</div>;
	},

	//creates an empty div if no error message
	noErrorMessage: function(){
		return <div></div>;
	},

	render: function(){
		//gets the appropriate error alert div depending on whether or not the form has an error
		var errorAlert;
		if(this.state.hasError){
			errorAlert = this.errorMessage();
		}else{
			errorAlert = this.noErrorMessage();
		}

		return (
			<div>
				{errorAlert}

				<div className="col-md-4">
				</div>

				<div className="col-md-4">
					<center>
						<h1>Sign Up</h1>
						
						<input type="radio" name="recruiter" value="false" onChange={this.accountChange}/>Job Seeker
						<input type="radio" name="recruiter" value="true" onChange={this.accountChange} />Recruiter
						<br />
						<input type="text" ref="firstName" placeholder="First Name" className="form-control" onKeyPress={this.handleKeyPress} /><br /> 
						<input type="text" ref="lastName" placeholder="Last Name" className="form-control" onKeyPress={this.handleKeyPress} /><br />
						<input type="email" ref="email" placeholder="Email Address" className="form-control" onKeyPress={this.handleKeyPress} /><br />
						<input type="password" ref="password" placeholder="Password" className="form-control" onKeyPress={this.handleKeyPress} /><br />
						<input type="password" ref="password_confirmation" placeholder="Password Confirmation" className="form-control" onKeyPress={this.handleKeyPress} /><br />
						
						<button onClick={this.handleSignUp} className="btn btn-primary">Create Account</button><br />
						Have an account? <Link to="/login">Login!</Link>
					</center>
				</div>
				<div className="col-md-4">
				</div>
			</div>
		);
	}
});

module.exports = SignUpForm;