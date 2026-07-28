export interface Article {
    id: number;
    title: string;
    image: string;
    description: string;
    newType?: string;
    content?: string;
    writer?: string;
    expiration_date: string;
    create_date: string;
}

export interface NewType {
  title: string;
  color: string;
}

export interface ArticleSimple {
  id: number;
  title: string;
  image: string;
  newType:  NewType;
  description: string;
  expiration_date: string;
  create_date: string;
}