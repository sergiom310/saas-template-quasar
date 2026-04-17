import { getPermsUser } from 'src/functions/function-auth';
import { api } from 'boot/axios'
import { date } from 'quasar'

export function laravelCan(permiso) {
    const perms = getPermsUser();

    if(perms) {
        return (perms.length > 0 && perms.indexOf(permiso) >= 0);
    }
    
    return false;
}

export function formatDate(fecha, formato = 'DD-MM-YYYY') {
    return date.formatDate(fecha, formato);
}

export function setAuthorization (token) {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
}
