import { Logo } from "../../config";

const Login = () => {
  return (
    <>
      <img className="mx-auto flex justify-center" src={Logo} />
      <hr className="border-1 border-gray-300 drop-shadow-xl hover:border-gray-500" />
    </>
  );
};

export default Login;
