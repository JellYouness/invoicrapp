export default function Header({
	showSelectMode,
}: {
	showSelectMode: boolean
}) {
	return (
		<div>
			<h2 className="text-xl md:text-2xl font-bold text-gray-900">
				{showSelectMode ? 'Select Client' : 'Client Management'}
			</h2>
			<p className="text-sm md:text-base text-gray-600 mt-1">
				{!showSelectMode
					? 'Choose a client for your invoice'
					: 'Manage your client database'}
			</p>
		</div>
	)
}
