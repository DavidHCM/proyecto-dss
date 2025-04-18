<script>
	import { Router, Route } from 'svelte-routing';
	import Login from './pages/Login.svelte';
	import Home from './pages/Home.svelte';
	import Deliveries from './pages/Del.svelte';
	import Users from './pages/Users.svelte';
	import Incidents from './pages/Incidents.svelte';
	import Routes from './pages/Routes.svelte';
	import Notifications from './pages/Notifications.svelte';
	import Ranking from './pages/Ranking.svelte';
	import Support from './pages/Support.svelte';
	import Profile from './pages/Profile.svelte';
	import test from './pages/test.svelte';
</script>

<Router>
	<Route path="/" component={Home} />
	<Route path="/login" component={Login} />
	<Route path="/deliveries" component={Deliveries} />
	<Route path="/users" component={Users} />
	<Route path="/incidents" component={Incidents} />
	<Route path="/routes" component={Routes} />
	<Route path="/notifications" component={Notifications} />
	<Route path="/ranking" component={Ranking} />
	<Route path="/support" component={Support} />
	<Route path="/profile" component={Profile} />
	<Route path="/test" component={test} />

</Router>

<!-- TODO: tener en cuenta que cuando se haga deploy se cambiaran los estilos que estan en public a sus home.svelte correspondientes --->
