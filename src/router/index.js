    import { createRouter, createWebHistory } from 'vue-router'
    import Login from '../components/Login.vue';
    import Register from '../components/Register.vue';
    import Dashboard from '../components/Dashboard.vue';
    import Settings from '../components/Settings.vue';
    import Profile from '../components/Profile.vue';
    import UserProfile from '../components/UserProfile.vue';
    import Friends from '../components/Friends.vue';
    import Chat from '@/components/Chat.vue';



    const routes = [
        {
            path: '/',
            name: 'login',
            component: Login
        },
        {
            path: '/register',
            name: 'register',
            component: Register
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: Dashboard
        },
        {
            path: '/settings',
            name: 'settings',
            component: Settings
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile
        },
        {
            path: '/profile/:userId',
            name: 'UserProfile',
            component: UserProfile,
            props: true
        },
        {
        path: '/friends',
        name: 'Friends',
        component: Friends
        },
        {
            path: '/chat/:chatId',
            name: 'Chat',
            component: Chat,
            props: true,
        }
    ]


    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    export default router;