import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export function useAuth() {
    return useContext(AuthContext);
}

export function effacer_tout_le_localStorage() {
    localStorage.clear();
}