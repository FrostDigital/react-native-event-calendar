import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import moment from "moment";

const TEXT_LINE_HEIGHT = 17;

export default class DayView extends Component {
	_onEventTapped = (event) => {
		this.props.eventTapped(event);
	};

	_renderEvents() {
		const { styles, events } = this.props;
		return events.map((event, i) => {
			const style = {
				left: event.left,
				height: event.height,
				width: event.width,
				top: event.top
			};

			const eventColor = {
				backgroundColor: event.color
			};

			const eventBorderColor = {
				borderColor: event.borderColor,
				borderWidth: 1
			};

			// Fixing the number of lines for the event title makes this calculation easier.
			// However it would make sense to overflow the title to a new line if needed
			const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
			const formatTime = this.props.format24h ? "HH:mm" : "hh:mm A";
			return (
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={() => this._onEventTapped(event)}
					key={i}
					style={[styles.event, style, event.color && eventColor, event.borderColor && eventBorderColor ]}
				>
					{this.props.renderEvent ? (
						this.props.renderEvent(event)
					) : (
						<View>
							<Text numberOfLines={1} style={styles.eventTitle}>
								{event.title || "Event"}
							</Text>
							{numberOfLines > 1 ? (
								<Text numberOfLines={numberOfLines - 1} style={[styles.eventSummary]}>
									{event.summary || " "}
								</Text>
							) : null}
							{numberOfLines > 2 ? (
								<Text style={styles.eventTimes} numberOfLines={1}>
									{moment(event.start).format(formatTime)} - {moment(event.end).format(formatTime)}
								</Text>
							) : null}
						</View>
					)}
				</TouchableOpacity>
			);
		});
	}

	_renderRedLine() {
		const offset = 100;
		const { width, styles } = this.props;
		const timeNowHour = moment().hour();
		const timeNowMin = moment().minutes();
		return (
			<View
				key={`timeNow`}
				style={[
					styles.lineNow,
					{
						top: offset * (timeNowHour - this.props.start) + (offset * timeNowMin) / 60,
						width
					}
				]}
			/>
		);
	}

	render() {
		const { styles, date, width } = this.props;
		const today = moment();
		const isToday = today.isSame(date, "day");
		let viewStyles = [styles.dayView, { width }];
		if (isToday) {
			viewStyles.push(styles.todayStyle);
		}

		return (
			<View style={viewStyles}>
				{this._renderEvents()}
				{isToday && this._renderRedLine()}
			</View>
		);
	}
}
