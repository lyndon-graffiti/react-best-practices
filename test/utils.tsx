import React from "react";
import { Form } from "antd";

export const withMockForm = (field: React.ReactNode) => {
  const formRef = React.createRef<any>();

  const MockForm = () => {
    const [form] = Form.useForm();
    //@ts-ignore
    formRef.current = form;
    return <Form form={form}>{field}</Form>;
  };

  return { formRef, MockForm };
};

export const removeRandomAttr = (fragment: DocumentFragment, attr: string) => {
  fragment
    .querySelectorAll(`[${attr}]`)
    .forEach((node) => node.removeAttribute(attr));
  return fragment;
};
