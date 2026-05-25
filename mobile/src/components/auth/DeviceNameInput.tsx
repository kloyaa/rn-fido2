import React from 'react';
import { TextInput } from './TextInput';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
}

export function DeviceNameInput({ value, onChangeText, error }: Props) {
  return (
    <TextInput
      label="Device name (optional)"
      placeholder="e.g. My iPhone, Work Laptop"
      value={value}
      onChangeText={onChangeText}
      error={error}
      maxLength={50}
    />
  );
}
