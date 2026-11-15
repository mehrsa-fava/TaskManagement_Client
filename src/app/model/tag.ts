export type TagColor =
  | 'Red'
  | 'Green'
  | 'Blue'
  | 'Yellow'
  | 'Pink'
  | 'Purple'
  | 'Brown'
  | 'Black';

export interface TaskTag {
  id: number;
  tagName: string;
  tagColor: TagColor;
}

export const TAG_COLOR_OPTIONS: { value: TagColor; label: string; className: string }[] = [
  { value: 'Red', label: 'Red', className: 'bg-red-100 text-red-800' },
  { value: 'Green', label: 'Green', className: 'bg-emerald-100 text-emerald-800' },
  { value: 'Blue', label: 'Blue', className: 'bg-sky-100 text-sky-800' },
  { value: 'Yellow', label: 'Yellow', className: 'bg-amber-100 text-amber-800' },
  { value: 'Pink', label: 'Pink', className: 'bg-pink-100 text-pink-800' },
  { value: 'Purple', label: 'Purple', className: 'bg-purple-100 text-purple-800' },
  { value: 'Brown', label: 'Brown', className: 'bg-orange-100 text-orange-900' },
  { value: 'Black', label: 'Black', className: 'bg-slate-800 text-white' },
];
