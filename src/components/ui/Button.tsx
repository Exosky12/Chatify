import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

export const buttonVariants = cva(
	'active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-color focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slae-400 disabled:opacity-50 disabled:pointer-events-none',
	{
		variants: {
			variant: {
				default: 'bg-[#10A37F] text-white hover:bg-[#16bd93]',
				ghost: 'bg-disabled hover:text-white-900 hover:bg-slate-200',
			},
			size: {
				default: 'h-10 py-2 px-4',
				sm: 'h-9 px-2',
				lg: 'h-11 px-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export type ButtonProps = {
	isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof buttonVariants>;

export const Button = ({
	className,
	children,
	variant,
	isLoading,
	size,
	...props
}: ButtonProps) => {
	return (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={isLoading}
			{...props}>
			{isLoading ? (
				<Loader2 className='w-4 h-4 mr-2 animate-spin' />
			) : null}
			{children}
		</button>
	);
};
