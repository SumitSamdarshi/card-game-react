//isLogged in
export const isLoggedIn = () => {
    const data = localStorage.getItem('data');
    if (data == null) {
        return false;
    } else {
        return true;
    }
}


//doLogin
export const doLogin = (data) => {
    localStorage.setItem("data", JSON.stringify(data));
}

//doLogOut
export const doLogOut = (next) => {
    localStorage.removeItem('data');
    next()
}

export const addPvp = (data) => {
    localStorage.removeItem('pvp');
    localStorage.setItem("pvp", JSON.stringify(data));
}

export const getPvp = () =>{
    if(localStorage.getItem('pvp')!=null){
        return JSON.parse(localStorage.getItem('pvp'))
    }
}


//getcurrentData
export const getCurrentUser = () => {
    if (isLoggedIn()) {
        return JSON.parse(localStorage.getItem('data')).user;
    } else {
        return undefined;
    }
}

//get token
export const getToken =() =>{
    if (isLoggedIn()) {
        return JSON.parse(localStorage.getItem('data')).token;
    } else {
        return undefined;
    }
}

//update user in local
export const updateUser = (userData) => {
    if (isLoggedIn()) {
        if(userData==null){
            doLogOut();
            return;
        }
        const token = getToken();
        const credential={
            'token': token,
            'user': userData
        }
        localStorage.setItem("data", JSON.stringify(credential));
    }
}