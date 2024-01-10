<script>
  import { Router, Route } from 'svelte-routing';
  import SideBar from './Components/Sidebar/Sidebar.svelte';
  import Home from './Route/Home/Home.svelte';

  let currentPage = (window.location.pathname).substring(1);
</script>

<div class='App dark-theme'>
    <SideBar currentPage={currentPage === '' ? 'Home' : currentPage} />
    <Router>
        <Route path='/'>
            <Home />
        </Route>

        <Route path='*'>
            <div style='width: 100%;'>
            </div>
        </Route>
    </Router>
</div>

<style>
    .App {
        width: 100vw;
        height: 100%;
    }
</style>
