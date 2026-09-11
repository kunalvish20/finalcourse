export default function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button className="signOutButton" type="submit">SIGN OUT</button>
    </form>
  );
}
