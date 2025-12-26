"use client";

import React, { ReactElement, ReactNode } from "react";
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

interface TabProps {
  children: ReactNode;
  title: string;
  value?: string;
}

export const Tab = ({ children }: TabProps) => {
  return <>{children}</>;
};

export const Tabs = ({
  children,
  defaultValue,
  className,
}: {
  children: ReactNode;
  defaultValue?: string;
  className?: string;
}) => {
  const tabs = React.Children.toArray(children).filter(
    (child): child is ReactElement<TabProps> => React.isValidElement(child)
  );

  if (tabs.length === 0) {
    return null;
  }

  // Extract titles and values.
  const headers = tabs.map((tab) => {
    const { title, value } = tab.props;
    return { title, value: value || title };
  });

  const defaultTab = defaultValue || headers[0]?.value;

  return (
    <ShadcnTabs defaultValue={defaultTab} className={className}>
      <TabsList>
        {headers.map((header) => (
          <TabsTrigger key={header.value} value={header.value}>
            {header.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const { title, value, children } = tab.props;
        const tabValue = value || title;

        return (
          <TabsContent
            key={tabValue}
            value={tabValue}
            className="p-4 border rounded-md mt-2"
          >
            {children}
          </TabsContent>
        );
      })}
    </ShadcnTabs>
  );
};
