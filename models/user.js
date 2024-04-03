// Copyright 2024 vincentlee
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define(
        'User', {
            email: {
                type: Sequelize.STRING,
                validate: {
                    isEmail: true,
                },
                allowNull: false,
            },
            first_name: {
                type: Sequelize.STRING,
            },
            last_name: {
                type: Sequelize.STRING,
            },
            wallet_address: {
                type: Sequelize.STRING,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
            }
        },
    );

    User.associate = (models) => {
        User.hasMany(
            models.Account,
            {
                foreignKey: 'user_id'
            }
        );
    };

    return User;
};
