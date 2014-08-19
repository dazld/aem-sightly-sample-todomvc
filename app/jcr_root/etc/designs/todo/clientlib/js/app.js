/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * Please note that some portions of this project are written by third parties
 * under different license terms. Your use of those portions are governed by
 * the license terms contained in the corresponding files. 
 */

(function ($) {
    'use strict';
    
    // Variables global to this script
    var todoapp = $('#todoapp');
    var key = {
        enter: 13,
        escape: 27
    };

    /**
     * Generic function that POSTs some action to the server and subsequently updates the view.
     * It takes the path and payload data attributes of the element and builds an
     * asynchronous POST request with it. Optionally, a value can be provided, which will
     * be integrated into the payload. Once the POST is done, it refreshes the view with
     * an asynchronous GET request.
     */
    function performAction(element, value) {
        // One line of magic to retreive the right element, depending on how the function was called
        element = (element instanceof $) ? element : $(element.target || element);
        
        var updatePath = todoapp.data('update-path');
        var path = element.data('path');
        var payload = element.data('payload');
        var payloadInput = element.data('payload-input');
        
        // Add the value to the payload if it was provided and if there is a data-payload-input attribute
        if (payloadInput && value !== undefined) {
            payload[payloadInput] = value;
        }
        
        // Do the post and subsequently update the view
        $.post(path, payload).done(function () {
            todoapp.load(updatePath);
        });
    }

    /**
     * Add a new todo item using sling default post servlet
     */
    function addItem(event) {
        if (event.which === key.enter) {
            var input = $(this);
            var value = input.val().trim();
            
            // Only create the item if the input value is not empty
            if (value.length) {
                performAction(input, value);
            }
        }
    }
    
    /**
     * Toggle the view, show textbox or label
     */
    function editItem() {
        $(this).closest('li').addClass('editing').find('.edit').focus();
    }
    
    /**
     * Submit updated item title and toggle the view to show the item
     */
    function updateItem(event) {
        var input = $(this);
        var item = input.closest('li');
        
        // Check that the item hasn't already been edited, because this method can be
        // called twice: once for hitting the enter key and once for the lost focus
        if (item.hasClass('editing')) {

            // Submit changes if focused out of input or if enter was pressed
            if (event.type === 'focusout' || event.which === key.enter) {
                var value = input.val().trim();

                item.removeClass('editing').find('label').text(value);

                // Only save if the value is not empty
                if (value.length) {
                    performAction(input, value);
                // Remove the item if the value was left empty
                } else {
                    item.find('.destroy').trigger('click');
                }

            // If escape was pressed, reset everything
            } else if (event.which === key.escape) {
                item.removeClass('editing');
                input.val(item.find('label').text());
            }
        }
    }

    /**
     * Complete/reopen a todo item
     */
    function toggleItem() {
        var input = $(this);
        
        performAction(input, input.is(':checked'));
    }
    
    // For the multiple ':applyTo' parameters to not be transformed into ':applyTo[]' upon POST, this has to be disabled
    $.ajaxSettings.traditional = true;

    // Attaching all events using delegation
    todoapp.on('keyup', '#new-todo', addItem);
    todoapp.on('dblclick', '.view label', editItem);
    todoapp.on('focusout keyup', '.edit', updateItem);
    todoapp.on('click', '.destroy', performAction);
    todoapp.on('change', '.toggle', toggleItem);
    todoapp.on('change', '#toggle-all', performAction);
    todoapp.on('click', '#clear-completed', performAction);

})(jQuery);
