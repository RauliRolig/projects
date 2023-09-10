<script>
  import Painike from './Painike.svelte';

  export let kuvaus;

  export let nimi;
</script>

<div class="kortti">
  <h1><b>{nimi}</b></h1>
  <br />
  <p>{kuvaus}</p>
  <Painike on:click>
    <img
      src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIGlkPSJMYXllcl8xIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4IiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNMzQwLjgsODNDMzA3LDgzLDI3Niw5OC44LDI1NiwxMjQuOGMtMjAtMjYtNTEtNDEuOC04NC44LTQxLjhDMTEyLjEsODMsNjQsMTMxLjMsNjQsMTkwLjdjMCwyNy45LDEwLjYsNTQuNCwyOS45LDc0LjYgIEwyNDUuMSw0MThsMTAuOSwxMWwxMC45LTExbDE0OC4zLTE0OS44YzIxLTIwLjMsMzIuOC00Ny45LDMyLjgtNzcuNUM0NDgsMTMxLjMsMzk5LjksODMsMzQwLjgsODNMMzQwLjgsODN6Ii8+PC9zdmc+"
      alt="sydan"
      width="30px"
    />
  </Painike>
</div>

<style>
  .kortti {
    border-radius: 5px;
    width: 400px;
    margin: 2em;
    border: 1px solid;
    box-shadow: 5px 5px 2px 2px rgba(100, 100, 100, 0.7);
    background-color: rgb(61, 61, 61);
    color: aliceblue;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
