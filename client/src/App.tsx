import { useEffect, useState } from "react";
import "./App.css";
import "./styles/chat.css"
import "./styles/open-chat-card.css"
import "./styles/toggle-button.css"
import "./styles/qr-form.css"
import JSCookies from 'js-cookie'
import "./styles/second-factor-page.css"
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import { MyProvider } from "./components/AppContext";
import SecondFactorPage from "./components/SecondFactorPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isTwoFactor, setTwoFactor] = useState(false);
  
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setTwoFactor(urlParams.has('2-fa'));

    const myCookie = JSCookies.get('accessToken');
    if (myCookie !== undefined || myCookie === '') {
      setLoggedIn(true);
    }
    // console.log(myCookie);
  }, []);
  return (
    <MyProvider loggedIn={loggedIn} setLoggedIn={setLoggedIn}>
      {isTwoFactor &&  <SecondFactorPage/>}
      {loggedIn && <HomePage />}
      {!loggedIn && <LoginPage /> }
      
    </MyProvider>
  );
}

export default App;
