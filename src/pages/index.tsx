import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!!sessionStorage.getItem("username")) {
      router.push("/custom");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <></>;
}
