import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';
import logoImage from "../../public/ganura.png"

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <Image src={logoImage} width={300} height={50} alt="Ganura logo" />
    </div>
  );
}
