import moment from "moment/moment";

// this method will return true if email is valid and false if not.
export const emailValidation = (email) => {
  const regex =
    /^\w+([.-]?\w+)*@[a-zA-Z0-9]+([.-]?[a-zA-Z0-9]+)*(\.[a-zA-Z]{2,3})+$/;
  return regex.test(email);
};

// this function will return true if password is correct or else will return an error
// NOTE: Think about more cases to make password strong
export const passwordValidation = (password) => {
  if (!password) return false;
  password = password.trim();
  if (password === "") return false;
  if (password.length < 8 || password.length > 20)
    // return "Password must contain more than 8 and less than 20 characters!";
    return false;
  if (!/[0-9]/g.test(password)) return false;
  // return "Password must contain atleast one number!";
  if (!/[A-Z]/g.test(password)) return false;
  // return "Password must contain atleast one uppercase letter!";
  if (!/[a-z]/g.test(password)) return false;
  // return "Password must contain atleast one lowercase letter!";

  return true;
};

export const nameValidation = (name) => {
  // NOTE: should i allow two spaces and show the error or
  const regex = /^[a-zA-Z ]{2,20}$/;
  return regex.test(name);
};

export const phoneNumber = () => {};

export const formatPhoneNumber = (value) => {
  if (value.length === 1) return "+1 (" + value;
  if (value.length === 7) return value + ") ";
  if (value.length === 12) return value + " - ";
  if (value.length > 13) return value;
};

export const validateDate = (date) => {
  if (
    date.trim().length === 0 ||
    !date.match(/^\d{2}\/\d{2}\/\d{4}$/) ||
    !new Date(date).getTime() ||
    !(
      Number(date.slice(-4)) < new Date().getFullYear() + 2 &&
      Number(date.slice(-4)) > 1900
    ) ||
    !moment(date, "MM/DD/YYYY").isValid()
  ) {
    return false;
  }
  return true;
};
