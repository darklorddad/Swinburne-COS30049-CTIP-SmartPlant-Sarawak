import React, { useState, useRef } from "react";
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from "react-native";

/**
 * ImageSlideshow
 * - measures the real container width so each item fills exactly that width
 * - snapToInterval and getItemLayout use measured width for perfect snap
 */
export default function ImageSlideshow({ imageURIs = [], onSlideChange }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(null);
    const flatListRef = useRef(null);

    // Make sure imageURIs is an array
    if (!Array.isArray(imageURIs)) imageURIs = imageURIs ? [imageURIs] : [];

    const onLayout = (e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w !== containerWidth) setContainerWidth(w);
    };

    const onScroll = (event /*: NativeSyntheticEvent<NativeScrollEvent> */) => {
        if (!containerWidth) return;
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / containerWidth);
        setActiveIndex(index);
        if (onSlideChange) onSlideChange(index);
        console.log(index)
    };

    // guard: nothing to render
    if (!imageURIs.length) return null;

    return (
        <View style={styles.outer} onLayout={onLayout}>
            {/* until we know containerWidth, render a placeholder sized by 100% width */}
            <FlatList
                ref={flatListRef}
                data={imageURIs}
                horizontal
                pagingEnabled={false} // use snapToInterval instead for precise snapping
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                onScroll={onScroll}
                scrollEventThrottle={16}
                snapToAlignment="start"
                decelerationRate="fast"
                // only set snapToInterval/getItemLayout once containerWidth is known
                {...(containerWidth ? { snapToInterval: containerWidth } : {})}
                {...(containerWidth
                    ? {
                        getItemLayout: (_, index) => ({
                            length: containerWidth,
                            offset: containerWidth * index,
                            index,
                        }),
                    }
                    : {})}
                contentContainerStyle={styles.flatListContent}
                // renderItem={({ item }) => (
                //     <View style={[styles.itemWrap, { width: containerWidth || "100%" }]}>
                //         <Image
                //             source={{ uri: item }}
                //             style={[styles.image, { width: containerWidth || "100%" }]}
                //             resizeMode="cover"
                //         />
                //     </View>
                // )}
                renderItem={({ item }) => (
                    <View style={[styles.itemWrap, { width: containerWidth || "100%" }]}>
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                            resizeMode="contain" // or "cover" if you prefer filling with cropping
                        />
                    </View>
                )}

            />

            {/* dots */}
            {imageURIs.length > 1 && (
                <View style={styles.dots}>
                    {imageURIs.map((_, i) => (
                        <View
                            key={i}
                            style={[styles.dot, activeIndex === i && styles.dotActive]}
                        />
                    ))}
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        // make sure parent doesn't add padding that affects child measurement;
        // if your parent has padding, the measured width will reflect the inside width,
        // which is what we want. You may remove padding on parent if you want full-screen images.
        alignItems: "center",
        position: "relative",
        width: "100%",
        overflow: "hidden", // prevent parts of image showing outside
    },
    flatListContent: {
        // center items vertically if needed
        alignItems: "center",
    },
    itemWrap: {
        // height can be adjusted
        height: 300,
        backgroundColor: "black", // fallback so no gray gaps show during fast swipes
    },
    image: {
        height: "100%",
    },
    dots: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 200,
        marginBottom: 8,
        position:"absolute"
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#bbb",
        marginHorizontal: 9,
    },
    dotActive: {
        backgroundColor: "#007AFF",
        transform: [{ scale: 1.2 }],
    },
});


