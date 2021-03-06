import { ActionTree } from "vuex";
import { AuthState, SetDisplayNamePayload } from "@web/store/modules/auth/AuthModuleTypes";
import { GlobalState } from "@web/store/StoreTypes";
import { auth } from "@web/config/FirebaseConfig";
import Logger from "@shared/Logger";
import { AuthMutations } from "@web/store/modules/auth/AuthMutations";
import { isBlank } from "@shared/util/ObjectUtil";
import { getRandomAnimalDispalyName } from "@web/util/AnimalNames";
import UserCredential = firebase.auth.UserCredential;

export enum AuthActions {
    watchAuth = "auth.watchAuth",
    signInAnonymously = "auth.signInAnonymously",
    setDisplayName = "auth.setDisplayName"
}

const logger = new Logger("AuthActions");
export const actions: ActionTree<AuthState, GlobalState> = {
    [AuthActions.watchAuth]: ({ commit }) => {
        auth().onAuthStateChanged(async user => {
            logger.info(`Auth state changed. User = `, user?.toJSON());
            commit(AuthMutations.authChanged, { user });
        });
    },
    [AuthActions.signInAnonymously]: async ({ dispatch }, params: { displayName?: string }): Promise<UserCredential> => {
        const cred = await auth().signInAnonymously();
        await dispatch(AuthActions.setDisplayName, {
            displayName: params.displayName || getRandomAnimalDispalyName()
        });
        return cred;
    },
    async [AuthActions.setDisplayName]({ commit }, payload: SetDisplayNamePayload) {
        if (isBlank(payload.displayName)) {
            payload.displayName = getRandomAnimalDispalyName();
        }
        commit(AuthMutations.setDisplayName, payload);
        const currentUser = auth().currentUser;
        if (currentUser) {
            await currentUser.updateProfile({
                displayName: payload.displayName
            });
        }
        // await dispatch(GamesActions.updatePlayer);
    }
};
