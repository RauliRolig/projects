<button on:click>
  <slot />
</button>

<style>
  button {
    border: 0.16em solid #aaa;
    border-radius: 100px;
    font-weight: 600;
    color: aliceblue;
    background-color: purple;
  }

  button:hover {
    border-color: black;
  }
</style>
