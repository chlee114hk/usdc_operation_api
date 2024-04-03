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
    const Account = sequelize.define(
        "Account", 
        {
            balance: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
            },
            locked: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0,
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
        {version: true}
    );

    Account.associate = (models) => {
        Account.hasMany(
            models.Request,
            {
                foreignKey: 'account_id'
            }
        );
        Account.belongsTo(
            models.User,
            { 
                foreignKey: 'user_id',
                targetKey: 'id'
            }
        );
    };

    return Account;
};