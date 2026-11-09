import { redirect } from "next/navigation";

export default function WhatThisIsNotRedirect() {
  redirect("/evidence#limits");
}
