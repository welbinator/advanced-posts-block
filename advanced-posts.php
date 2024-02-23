<?php
/**
 * Plugin Name:       Advanced Posts
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       advanced-posts
 *
 * @package           create-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

function render_advanced_posts_block($attributes) {
    $args = array(
        'post_type' => $attributes['postType'],
        'posts_per_page' => 10, // Adjust as needed
    );

    // If a taxonomy and terms are set, modify the query to filter by these terms
    if (!empty($attributes['taxonomy']) && !empty($attributes['terms'])) {
        $args['tax_query'] = array(
            array(
                'taxonomy' => $attributes['taxonomy'],
                'field'    => 'term_id',
                'terms'    => $attributes['terms'],
            ),
        );
    }

    $query = new WP_Query($args);
    $posts_output = '';

    if ($query->have_posts()) {
        $posts_output .= '<ul class="advanced-posts-list">';
        while ($query->have_posts()) {
            $query->the_post();
            $posts_output .= '<li>';
            $posts_output .= '<a href="' . esc_url(get_permalink()) . '">' . get_the_title() . '</a>'; // Post Title
            $posts_output .= '</li>';
        }
        $posts_output .= '</ul>';
    } else {
        $posts_output = 'No posts found.';
    }

    wp_reset_postdata();

    return $posts_output;
}


/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function advanced_posts_block_register_block() {
    register_block_type( __DIR__ . '/build', array(
        'render_callback' => 'render_advanced_posts_block',
    ));
}

add_action( 'init', 'advanced_posts_block_register_block' );


