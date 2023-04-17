import Image from "@components/Image";
import { FC } from "react";
import styles from "./index.module.scss";

interface Props {
  imgList: string[];
  size?: number;
}

const AvatarList: FC<Props> = (props: Props) => {
  const { imgList, size = 22 } = props || {};
  return (
    <div className={styles.container}>
      {imgList.map((it, index) => (
        <Image
          key={`{${it}-${index}}`}
          src={it}
          width={size}
          height={size}
          className={styles.img}
          style={{ zIndex: imgList.length - index }}
        />
      ))}
    </div>
  );
};

export default AvatarList;
